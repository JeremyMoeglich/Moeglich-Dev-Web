import { type ReactNode, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";

function SomeComponent1<T>({ value }: { value: T }) {
    const [currentId, setCurrentId] = useState(v4());
    const memo_value = useMemo(() => value, [value]);
    useEffect(() => {
        setCurrentId(v4());
    }, [memo_value]);
    return (
        <div>
            <div>Current ID: {currentId}</div>
            <div>Value: {value as ReactNode}</div>
        </div>
    );
}

function SomeComponent2<T>({ value }: { value: T }) {
    const [currentId, setCurrentId] = useState(v4());
    const [lastValue, setLastValue] = useState(value);
    useEffect(() => {
        if (value !== lastValue) {
            setCurrentId(v4());
            setLastValue(value);
        }
    }, [value]);
    return (
        <div>
            <div>Current ID: {currentId}</div>
            <div>Value: {value as ReactNode}</div>
        </div>
    );
}

function SomeComponent3<T>({ value }: { value: T }) {
    const [currentId, setCurrentId] = useState(v4());
    useEffect(() => {
        setCurrentId(v4());
    }, [value]);
    return (
        <div>
            <div>Current ID: {currentId}</div>
            <div>Value: {value as ReactNode}</div>
        </div>
    );
}

import { isEqual } from "lodash-es";
function SomeComponent4<T>({ value }: { value: T }) {
    
    const [currentId, setCurrentId] = useState(v4());
    const [lastValue, setLastValue] = useState(value);
    useEffect(() => {
        if (!isEqual(value, lastValue)) {
            setCurrentId(v4());
            setLastValue(value);
        }
    }, [value]);
    return (
        <div>
            <div>Current ID: {currentId}</div>
            <div>Value: {value as ReactNode}</div>
        </div>
    );
}
