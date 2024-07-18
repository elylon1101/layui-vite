export class Rtpl {
    /**
     * 响应式数据
     */
    renderData
    /**
     * {Page} page
     */
    page
    subscriber = {}
    loopElement = {}

    /**
     * 响应式对象key
     * @type {string[]}
     */
    originDataKey = []

    static variableRegExp = /\{\{ *([^}]+?) *}}/g;
    static methodRegExp = /([^(]+)\(([^)]*)\)/g;
    static loopExp1 = /\(([^,]+),([^)]+)\)\s+in\s+(.*)/g;
    static loopExp2 = /(\w+)\s+in\s+(.*)/g;

    static templateCache = new Map()

    /**
     *
     * @param {Page} page
     * @param {any} renderData
     */
    constructor(page, renderData = undefined) {
        this.page = page;
        this.originDataKey = Object.keys(renderData ?? page.renderData)
        if (renderData) {
            this.renderData = this.reactive(renderData)
        } else {
            this.renderData = this.reactive(page.renderData)
            page.renderData = this.renderData
        }
    }

    start(el, template) {
        if (!el) return
        // 将dom字符串解析为dom对象
        let templateDom
        if (Rtpl.templateCache.get(template)) {
            templateDom = Rtpl.templateCache.get(template)
        } else {
            templateDom = new DOMParser().parseFromString(template, 'text/html');
            Rtpl.templateCache.set(template, templateDom)
        }
        // 创建一个新的空白的文档片段
        let virtualDom = document.createDocumentFragment();
        // 填充样式
        let styles = templateDom.head.cloneNode(true).childNodes
        for (let i = 0; i < styles.length; i++) {
            virtualDom.appendChild(styles[i])
        }
        // 编译模板
        let childNodes = templateDom.body.cloneNode(true).childNodes
        for (let i = 0; i < childNodes.length; ++i) {
            virtualDom.appendChild(this.compile(childNodes[i]));
        }
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.appendChild(virtualDom);
    }

    compile(node, isLoop) {
        let element = node.cloneNode(false);
        if (isLoop) {
            node = node.cloneNode(true);
            element.innerHTML = '';
        }
        for (let i = 0; i < node.childNodes.length; ++i) {
            let child = node.childNodes[i];
            if (this.isLoop(child)) {
                let ns = this.compileLoop(child, element);
                for (let j = 0; j < ns.length; ++j) {
                    element.appendChild(ns[j]);
                }
            } else {
                element.appendChild(this.compile(child));
            }
        }
        let removeAttr = []
        if (element.nodeType === Node.TEXT_NODE) {
            let vars = this.parseVariable(element.textContent);
            for (let i = 0; i < vars.length; ++i) {
                let directive = this.directive(element, vars[i], element.textContent);
                this.addSubscriber(vars[i], directive);
            }
        } else if (element.nodeType === Node.ELEMENT_NODE && element.attributes) {
            let attrs = element.attributes;
            for (let i = 0; i < attrs.length; ++i) {
                let name = attrs[i].name;
                if (name.startsWith("v-bind") || name.startsWith(":") || name.startsWith("v-model") || name.startsWith("v-html")) {
                    let vars = this.parseVariable(attrs[i].value);
                    if (vars.length === 0) {
                        let directive = this.directive(element, name, attrs[i].value);
                        this.addSubscriber(attrs[i].value, directive);
                    } else {
                        for (let j = 0; j < vars.length; j++) {
                            let directive = this.directive(element, name, attrs[i].value);
                            this.addSubscriber(vars[j], directive);
                        }
                    }
                    removeAttr.push(name)
                }
                if (name.startsWith("v-on:")) {
                    let event = name.substring(5);
                    this.addEvent(element, event, this.parseMethod(attrs[i].value));
                    removeAttr.push(name)
                }
                if (name.startsWith("@")) {
                    let event = name.substring(1);
                    this.addEvent(element, event, this.parseMethod(attrs[i].value));
                    removeAttr.push(name)
                }
                let vars = this.parseVariable(attrs[i].value);
                if (vars.length > 0) {
                    for (let j = 0; j < vars.length; j++) {
                        if (this.originDataKey.includes(vars[i])) {
                            let directive = this.directive(element, name, attrs[i].value);
                            this.addSubscriber(vars[j], directive);
                        }
                    }
                }
            }
        }
        this.assignValue(element);
        for (let i = 0; i < removeAttr.length; i++) {
            element.removeAttribute(removeAttr[i])
        }
        return element;
    }

    compileLoop(element, parent) {
        let that = this;
        let vFor = element.attributes['v-for'].value;
        let itemName, indexName, varName;

        let match;
        Rtpl.loopExp1.lastIndex = 0
        Rtpl.loopExp2.lastIndex = 0
        if ((match = Rtpl.loopExp1.exec(vFor)) !== null) {
            itemName = match[1];
            indexName = match[2]
            varName = match[3];
        } else if ((match = Rtpl.loopExp2.exec(vFor)) !== null) {
            itemName = match[1];
            varName = match[2];
        }
        let directive = {
            origin: element.cloneNode(true),
            attr: 'v-for',
            exp: {
                varName: varName,
                indexName: indexName,
                itemName: itemName
            }
        }
        element.removeAttribute('v-for');
        let arrays = this.renderData[varName];
        let elements = [];
        for (let i = 0; i < arrays?.length; ++i) {
            this.renderData[itemName] = arrays[i];
            this.renderData[indexName] = i;
            elements.push(this.compile(element.cloneNode(true), true));
        }
        if (!this.loopElement[varName]) {
            let loop = {};
            loop.elements = elements;
            loop.parent = parent;
            this.loopElement[varName] = loop;
        }
        directive.change = function (name) {
            let ele = that.loopElement[name];
            for (let i = 0; i < ele.elements.length; ++i) {
                ele.elements[i].remove();
            }
            let newElements = [];
            let arrays = that.renderData[this.exp.varName];
            for (let i = 0; i < arrays?.length; ++i) {
                that.renderData[this.exp.itemName] = arrays[i];
                that.renderData[this.exp.indexName] = i;
                newElements.push(that.compile(this.origin.cloneNode(true), true));
            }
            that.loopElement[name].elements = newElements;
            for (let j = 0; j < newElements.length; ++j) {
                newElements[j].removeAttribute('v-for');
                ele.parent.appendChild(newElements[j]);
            }
        }
        this.addSubscriber(varName, directive);
        return elements;
    }

    /**
     *
     * @param { HTMLElement } node
     * @param { string } attr 属性名
     * @param { any } expression 属性值
     * @constructor
     */
    directive(node, attr, expression) {
        let directive = { node: node, origin: expression, attr: attr }
        let that = this;
        if (node.nodeType === Node.TEXT_NODE) {
            directive.change = function () {
                this.node.textContent = that.evaluateExpression(this.origin);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (attr.startsWith(":")) attr = attr.substring(1);
            directive.attr = attr;
            if (attr === 'v-model') {
                directive.change = function (name, value) {
                    this.node.value = value;
                }
                node.addEventListener('input', function (e) {
                    that.valueTrigger(expression, e.target.value);
                })
            } else if (attr === 'v-html') {
                directive.change = function (name, value) {
                    that.appendHtml(this.node, value)
                }
            } else {
                directive.change = function (name, value) {
                    Rtpl.variableRegExp.lastIndex = 0
                    let newValue = this.origin.replace(Rtpl.variableRegExp, (match, variable) => {
                        if (variable === name) {
                            return value;
                        } else {
                            return match;
                        }
                    });
                    this.node.setAttribute(attr, newValue)
                }
            }
        }
        return directive;
    }

    addEvent(element, event, method) {
        let params = [];
        let paramNames = method.params;
        if (paramNames) {
            for (let i = 0; i < paramNames.length; ++i) {
                params.push(this.getVariableValue(paramNames[i]))
            }
        }
        element.addEventListener(event, () => {
            this.page[method.name].apply(this.page, params);
        })
    }

    /**
     * 解析文本中变量，也就是类似{{xxx}}字符串
     * @param content 要解析的文本
     * @return {*[]} 所有{{xxx}} 中的xxx变量名
     */
    parseVariable(content) {
        const uniqueVariables = new Set();
        let match;
        Rtpl.variableRegExp.lastIndex = 0
        while ((match = Rtpl.variableRegExp.exec(content)) !== null) {
            uniqueVariables.add(match[1]);
        }
        return Array.from(uniqueVariables);
    }

    parseMethod(exp) {
        let method = {};
        if (exp.indexOf('(') === -1) {
            return { name: exp, params: [] }
        }
        let match;
        Rtpl.methodRegExp.lastIndex = 0
        if ((match = Rtpl.methodRegExp.exec(exp)) !== null) {
            method.name = match[1];
            let params = match[2];
            params = params.replace(/\s+/g, '');
            if (params && params.length > 0) {
                method.params = params.split(",");
            } else {
                method.params = [];
            }
        }
        return method;
    }

    addSubscriber(variableName, directive) {
        let item = this.subscriber[variableName];
        if (!item) {
            item = [];
        }
        item.push(directive);
        this.subscriber[variableName] = item;
    }

    /**
     * 判断是否是循环指令
     * @param {ChildNode} element
     * @return {boolean}
     */
    isLoop(element) {
        return element.attributes && element.attributes['v-for'];
    }

    valueTrigger(expression, value) {
        if (this.renderData[expression] !== undefined) {
            this.renderData[expression] = value;
        }
    }

    assignValue(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            element.textContent = this.evaluateExpression(element.textContent);
        } else {
            let attrs = element.attributes;
            for (let k in attrs) {
                let text = attrs[k];
                if (text && typeof text === 'string' || text.name === 'v-html') {
                    if (text.name === 'v-html') {
                        let dom = this.evaluateExpression(`{{${ element.attributes[k].value }}}`);
                        this.appendHtml(element, dom)
                    } else {
                        element.attributes[k].value = this.evaluateExpression(element.attributes[k].value);
                    }
                } else {
                    let vars = this.parseVariable(element.attributes[k].value);
                    if (vars.length > 0) element.attributes[k].value = this.evaluateExpression(element.attributes[k].value);
                }
            }
        }
    }

    evaluateExpression(text) {
        let vars = this.parseVariable(text);
        for (let i = 0; i < vars.length; ++i) {
            let value = this.getVariableValue(vars[i]);
            Rtpl.variableRegExp.lastIndex = 0
            text = text.replace(Rtpl.variableRegExp, (match, variable) => {
                if (variable === vars[i]) {
                    return value;
                } else {
                    return match;
                }
            });
        }
        return text;
    }

    getVariableValue(expression) {
        let func = new Function('renderData', `with (renderData) { return ${ expression } ; }`);
        try {
            return func(this.renderData);
        } catch (e) {
            return ''
        }
    }

    appendHtml(element, htmlStr) {
        let childNodes = new DOMParser().parseFromString(htmlStr, 'text/html').body.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            element.appendChild(childNodes[i].cloneNode(true))
        }
    }

    /*getVariableValue(name) {
        let value;
        if (name.indexOf(".")) {
            let ss = name.split(".");
            value = this.renderData[ss[0]];
            if (value) {
                for (let i = 1; i < ss.length; ++i) {
                    value = value[ss[i]];
                    if (value === undefined) {
                        break;
                    }
                }
            }
        } else {
            value = this.renderData[name];
        }
        if (value === undefined || value === null) {
            value = "";
        }
        return value;
    }*/

    reactive(obj) {
        let that = this;
        Object.keys(obj).forEach(objKey => {
            if ((typeof obj[objKey] === 'object' && obj[objKey]) || typeof obj[objKey] === 'function') {
                obj[objKey] = new Proxy(obj[objKey], {
                    set(target, key, val) {
                        target[key] = val
                        let items = that.subscriber[objKey];
                        if (items) {
                            for (let i = 0; i < items.length; ++i) {
                                items[i].change(objKey, val);
                            }
                        }
                        return true
                    }
                })
            }
        })
        return new Proxy(obj, {
            get(target, key) {
                return target[key]
            },
            set(target, key, val) {
                target[key] = val
                let items = that.subscriber[key];
                if (items) {
                    for (let i = 0; i < items.length; ++i) {
                        items[i].change(key, val);
                    }
                }
                return true
            }
        })
    }
}
