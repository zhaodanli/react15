import useDrag from './../hooks/useDrag';

let style = {width:'100px',height:'100px',borderRadius:'50%'};

export default function Drag() {

    const [style1, dragRef1] = useDrag()
    const [style2, dragRef2] = useDrag()

    return (
        <>
            <div
                ref={dragRef1}
                style={{...style,backgroundColor:'red',transform: `translate(${style1.x}px, ${style1.y}px)` }}
            ></div>
             <div
                ref={dragRef2}
                style={{...style,backgroundColor:'green',transform: `translate(${style2.x}px, ${style2.y}px)` }}
            ></div>
        </>
    )
}