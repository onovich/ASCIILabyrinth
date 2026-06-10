import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const projectRoot = resolve(import.meta.dirname, '..');

export async function loadSharedData() {
  const schemaPath = resolve(projectRoot, 'origin', 'shared', 'game-schema.js');
  const source = await readFile(schemaPath, 'utf8');
  const context = {
    window: {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    },
    structuredClone,
    Date,
    Math,
    Number,
    String,
    Array,
    Object,
    RegExp,
    JSON
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: schemaPath });
  return context.window.ASCII_LABYRINTH_DATA;
}

export function createDomElement(tagName) {
  const element = {
    tagName,
    className: '',
    dataset: {},
    style: {},
    attributes: {},
    listeners: {},
    textContent: '',
    children: [],
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    addEventListener(type, handler) {
      this.listeners[type] ||= [];
      this.listeners[type].push(handler);
    },
    appendChild(child) {
      this.children.push(child);
    },
    click() {
      this.clicked = true;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    querySelectorAll(selector) {
      const matches = [];
      const visit = (node) => {
        if (selector === '.al-panel-line' && String(node.className || '').split(/\s+/).includes('al-panel-line')) {
          matches.push(node);
        }
        (node.children || []).forEach(visit);
      };
      visit(this);
      return matches;
    }
  };
  element.classList = {
    contains: (name) => String(element.className || '').split(/\s+/).includes(name)
  };
  return element;
}

export async function loadSharedUi() {
  const uiPath = resolve(projectRoot, 'origin', 'shared', 'ui-system.js');
  const source = await readFile(uiPath, 'utf8');
  const elements = new Map();
  const objectUrls = [];
  const context = {
    window: {},
    document: {
      createElement: createDomElement,
      getElementById: (id) => elements.get(id) || null
    },
    Blob: class SmokeBlob {
      constructor(parts = [], options = {}) {
        this.parts = parts;
        this.type = String(options.type || '');
        this.size = parts.reduce((size, part) => size + String(part ?? '').length, 0);
      }
    },
    URL: {
      createObjectURL: (blob) => {
        objectUrls.push(blob);
        return `blob:smoke-${objectUrls.length}`;
      },
      revokeObjectURL: () => {}
    },
    String,
    Object
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: uiPath });
  return { ui: context.window.ASCIIUI, elements };
}
