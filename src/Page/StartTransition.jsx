import React, { startTransition, useEffect, useState } from 'react';
function getSuggestions(keyword) {
    let items = new Array(10000).fill(keyword)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(items);
        }, 1000 * keyword.length);
    });
}

function Suggestion(props) {
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        if (props.keyword && props.keyword.length > 0) {
            getSuggestions(props.keyword).then(suggestions => {
                // setSuggestions(suggestions);
                // 优化
                // startTransition主要为了能在大量的任务下也能保持 UI 响应
                // startTransition可以通过将特定更新标记为过渡来显着改善用户交互
                startTransition(() => {
                    setSuggestions(suggestions);
                })
            })
        }
    }, [props.keyword]);
    useEffect(() => {
        console.log(props.keyword);
    })
    return (
        <ul>
            {
                suggestions.map((item, index) => (<li key={index}>{item}</li>))
            }
        </ul>
    )
}
function StartTransitionPage() {
    const [keyword, setKeyword] = useState("");
    const handleChange = (event) => {
        setKeyword(event.target.value);
    };
    return (
        <div>
            <div>关键字<input value={keyword} onChange={handleChange} /></div>
            <Suggestion keyword={keyword} />
        </div>
    );
}
export default StartTransitionPage