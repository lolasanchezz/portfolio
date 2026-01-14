import styles from './indProject.module.css'
import Image from 'next/image'
import {useState, useEffect} from 'react'
import projData from './projects.json'
import { JSX } from "react/jsx-runtime";
import { text } from 'stream/consumers';

const Header = (props: {name: string, gh: string, demo: string, backFunc: any}) => {
    return (
        <div className = {styles.headerCont}>
            <p onClick = {() => {props.backFunc(null)}} className = {styles.backButton}>x</p>
        <div className = {styles.header}>    
            <h1 style = {{textDecoration: 'underline'}}>{props.name}</h1>
            <div className = {styles.linkCont}>
                <p>links</p>
            <div className = {styles.smallLinkCont}>
               {props.gh == ""? <></>: <a href={props.gh}>github</a>}
                <img className = {styles.icon} height={10} width={10} src='/github.png' alt='github' />
                <a href={props.demo}>demo</a>
                </div>
            </div>
        </div>
        </div>
    )
}
const Imgwsub = (props: {src: string, sub: string, width: number, asp: number, index?: number}) => {
    const [dimensions, setDimensions] = useState({ height: 0, width: 0 })

    useEffect(() => {
        const calculateDimensions = () => {
                        const w = window.innerWidth * props.width

            const h = w * props.asp
            setDimensions({ height: h, width: w })
        }
        calculateDimensions() 
        window.addEventListener('resize', calculateDimensions) 
    }, [window.innerHeight, window.innerWidth])

    return (
        <div className={styles.imageCont} key={props.index}>
            <img height={dimensions.height} width={dimensions.width} src={'/images/' + props.src} alt={props.src} />
            <p>{props.sub}</p>
        </div>
    )
}

const TextBlock = (props: {header: string, text: string, index?: number}) => {
return (
    <div className = {styles.textBlock}>
        <h2>{props.header}</h2>
        <p>{props.text}</p>
    </div>
)
}

export const IndProject = (props: {goBackFunc: any, name: string}) => {
    const data = projData.find(o => o.shortname === props.name);
if (!data) {
    throw new Error("couldnt access json"); //this should never happen but typescript is being annoying about it
}
    return (
       
        <div className = {styles.projContainer}>
            {data? (
                <>          
                <Header backFunc = {props.goBackFunc} name={data.name} gh={data.links.gh} demo={data.links.demo}/>
            <div className = {styles.imagesCont}>
                {data.images.map((imageData, index) => (<Imgwsub index={index} asp={imageData.asp} width={(1/data.images.length)-(1/(4* data.images.length))} src={props.name + "/" + imageData.src} sub={imageData.subtitle}></Imgwsub>))}
            </div>
        <div className = {styles.textBlockCont}>
            {data.text.map((textData, index) => (<TextBlock header={textData.header} index = {index} text={textData.body}/>))}
        </div>
        </>): <p>loading...</p>}
        </div>
        
    )
}



