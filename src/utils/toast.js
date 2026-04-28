const subscribers = new Set();

const emit = (t) => subscribers.forEach(fn => fn(t));

export const toast = {
    success: (message) => emit({ id: Date.now() + Math.random(), message, type: 'success' }),
    error:   (message) => emit({ id: Date.now() + Math.random(), message, type: 'error'   }),
    info:    (message) => emit({ id: Date.now() + Math.random(), message, type: 'info'    }),
    _subscribe: (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    },
};
