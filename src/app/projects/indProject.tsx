import styles from './indProject.module.css'
import Image from 'next/image'
import {useState, useEffect} from 'react'
import projData from './projects.json'
const Header = (props: {name: string, gh: string, demo: string, backFunc: any}) => {
    return (
        <div className = {styles.headerCont}>
            <p onClick = {() => {props.backFunc(null)}} className = {styles.backButton}>x</p>
        <div className = {styles.header}>    
            <h1 style = {{textDecoration: 'underline'}}>{props.name}</h1>
            <div className = {styles.linkCont}>
                <p>links</p>
            <div className = {styles.smallLinkCont}>
                <a href={props.gh}>github</a>
                <Image className = {styles.icon} height={10} width={10} src='/github.png' alt='github' />
                <a href={props.demo}>demo</a>
                </div>
            </div>
        </div>
        </div>
    )
}
const Imgwsub = (props: {src: string, sub: string, width: number, asp: number}) => {
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
        <div className={styles.imageCont}>
            <Image height={dimensions.height} width={dimensions.width} src={'/images/' + props.src} alt={props.src} />
            <p>{props.sub}</p>
        </div>
    )
}

const TextBlock = (props: {header: string, text: string}) => {
return (
    <div className = {styles.textBlock}>
        <h2>{props.header}</h2>
        <p>{props.text}</p>
    </div>
)
}



export const SecProject = (props: {goBackFunc: any}) => {
    console.log(props.goBackFunc)
    return (
        <div className = {styles.projContainer}>
           <Header backFunc = {props.goBackFunc} name="graph the sec" gh="link" demo="link"/>
            <div className = {styles.imagesCont}>
                <Imgwsub asp={1} width={0.25} src = 'sec/landing.png' sub="landing page"/>
                <Imgwsub asp={0.8} width={0.25} src = 'sec/search.png' sub="searching for Vail Inc (MTN)'s data"/>
                <Imgwsub asp={0.8} width={0.25} src = 'sec/mtnsearch.png' sub="the results!"/>
            </div>
        <div className = {styles.textBlockCont}>
        <TextBlock header = "overview" text = 
        "A website to look at "
        ></TextBlock> 
        </div>
        </div>
    )
}



export const IndProject = (props: {goBackFunc: any, name: string}) => {
    let data;
    for (let object of projData) {
        if (object.shortname == props.name) {
            data = object
            break
        }
    }
    console.log(data)
    return (
       
        <div className = {styles.projContainer}>
            {data? (
                <>          
                <Header backFunc = {props.goBackFunc} name={data!.name} gh="link" demo="link"/>
            <div className = {styles.imagesCont}>
                <Imgwsub asp={1} width={0.25} src = 'sec/landing.png' sub="landing page"/>
                <Imgwsub asp={0.8} width={0.25} src = 'sec/search.png' sub="searching for Vail Inc (MTN)'s data"/>
                <Imgwsub asp={0.8} width={0.25} src = 'sec/mtnsearch.png' sub="the results!"/>
            </div>
        <div className = {styles.textBlockCont}>
        <TextBlock header = "overview" text = 
        "A website to look at "
        ></TextBlock> 
        </div>
        </>): <p>loading...</p>}
        </div>
        
    )
}


export const SecondProject = () => {
    return (
<div></div>    )
}


