import React from 'react';

type Props = {
    children: React.ReactNode;
};
export const Line: React.FC<Props> = ({children}) => {
    return (
        <div className={"flex gap-2 items-center mt-5"}>
            {children}
        </div>
    );
};