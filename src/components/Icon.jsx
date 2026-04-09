import React from 'react';
const { useEffect, useRef } = React;

export default function Icon({name, className = '', size=24}){
    const iconRef = useRef(null);

    useEffect(()=>{
        if (iconRef.current && window.lucide){
            const iconElement = window.lucide.createElement(window.lucide[name]);
            iconRef.current.innerHTML = '';
            iconRef.current.appendChild(iconElement);
        }
    }, [name]);

    return (
        <span
            ref={iconRef}
            className={className}
            style={{ width: size, height: size, display: 'inline-block' }}
        ></span>
    );
}
