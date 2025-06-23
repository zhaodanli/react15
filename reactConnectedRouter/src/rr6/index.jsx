import React from 'react';
import { Router } from 'react-router';

export function HistoryRouter({ history, children }) {
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });
    React.useLayoutEffect(() => {
        history.listen(setState);
    }, [history]);
    return (
        <Router
            location={state.location}
            action={state.action}
            navigator={history}
            navigationType={state.action}
        >
            {children}
        </Router>
    )

}