import React from 'react';

const FadingLines = () => {

    const lines = [];

    //Add extra thin lines at the top
    
    for (let i = 0; i < 10; i++) {
        lines.push(
            <div
                key={`thick-${i}`}
                style={{
                    height: `${i + 1}px`, // Increasing thickness
                    backgroundColor: 'black',
                    marginBottom: `${10-i}px`,
                }}
            />
        );
    }

    // for (let i = 0; i < 3; i++) {
    //     lines.push(
    //         <div
    //             key={`thick-${i}`}
    //             style={{
    //                 height: `${i+17}px`, // Increasing thickness
    //                 backgroundColor: 'black',
    //                 marginBottom: '8px',
    //             }}
    //         />
    //     );
    // }

    return <div>{lines}</div>;
};

export default FadingLines;
