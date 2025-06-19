// 提高数据修改的门槛
// 模块之间需要共享数据和数据可能被任意修改导致不可预料的结果之间有矛盾
// 所有对数据的操作必须通过 dispatch 函数
function dispatch(action) {
    switch (action.type) {
        case 'UPDATE_TITLE_COLOR':
            initState.title.color = action.color;
            break;
        case 'UPDATE_CONTENT_CONTENT':
            initState.content.text = action.text;
            break;
        default:
            break;
    }
}

// 封装仓库
function createStore(reducer) {
    let state;
    let listeners=[];

    function getState() {
        return state;
    }

    function dispatch(action) {
        state = reducer(state, action);
        listeners.forEach(l=>l());
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(item => item!=listener);
            console.log(listeners);
        }
    }

    // 初始化数据
    dispatch({});

    return {
        getState,
        dispatch,
        subscribe
    }
}

let reducer = (state = initState, action) => {
    console.log('reducer', state, action)
    switch (action.type) {
        case 'UPDATE_TITLE_COLOR':
            return { ...state, title: { ...state.title, color: action.color } };
        case 'UPDATE_CONTENT_CONTENT':
            return { ...state, content: { ...state.content, text: action.text } };
            break;
        default:
            return state;
    }
}

let initState = {
    title: { color: 'red', text: '标题' },
    content: { color: 'green', text: '内容' }
}

// 创建仓库
let store = createStore(reducer);


function renderTitle(title) {
    console.log('title', title.text, title.color)
}
function renderContent(content) {
    console.log('content', content.text, content.color)
}
function render() {
    renderTitle(store.getState().title);
    renderContent(store.getState().content);
}
render();

// 监控数据变化
let unsubscribe = store.subscribe(render);
setTimeout(function () {
    store.dispatch({type:'UPDATE_TITLE_COLOR',color:'purple'});
    unsubscribe();
    store.dispatch({type:'UPDATE_CONTENT_CONTENT',text:'新标题'});
},2000);
