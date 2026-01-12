'use client'
import styles from "./about.module.css"
import CatComp from "../three-scrips/CatComp"
import allHobbys from "./about.json"
import {useState, useEffect} from 'react'
import Image from 'next/image'
/*
export default function About() {
    const [message, setMessage] = useState('...')
    const [hovered, setHovered] = useState('')
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    return (
        <div className = {styles.page}>
    <div className = {styles.header}>
        <h1>about</h1>
        <CatComp width = {75} height = {75}/>
    </div>
    <div className = {styles.main}>
        <div className = {styles.hobbyNamesCont}>
            {allHobbys.map((val, index) => (
                <div onClick = {() => {
                    setMessage(val.desc)
                    setHovered(val.title)}}
                className = {styles.hobbyRow}
                style = {(hovered == val.title)? {color: 'blue'}: {}}
                key = {index}>
                    <h2> {'> ' + val.title}</h2>
                    </div>
            ))}
        </div>
        <div className = {styles.messageCont}>
            <div className = {styles.bubbleCont}>
            <Image className = {styles.bubble} alt = "bubble" src = "/speechbubble.png" height = {windowDimensions.height * 0.8} width = {windowDimensions.width * 0.6}></Image>
            </div>
            <div className = {styles.meImg}>
            <Image  alt = "me" src = "/me.png" height = {window.innerHeight / 3} width = {(window.innerHeight / 3)}/>
            </div>
            <div className = {styles.textDiv}
                style = {{fontSize: `${Math.min(window.innerHeight * 0.025, window.innerWidth * 0.018)}px`}}>
                <p>{message}</p>
            </div>
            
        </div>
    </div>
</div>
)
}
*/

export default function About() {
    return (
        <div className = {styles.page}>
    <div className = {styles.header}>
        <h1>about</h1>
        <CatComp width = {75} height = {75}/>
    </div>
    <div className = {styles.specialCont}>
        <p>lola sanchez</p>
        <p>lsanchez@gcschool.org</p>
        <p>github: lolasanchezz</p>
        <a href="www.linkedin.com/in/lola-sanchez-55193a31a">linkedin: Lola Sanchez</a>
        <p>based in nyc</p>
    </div>
    </div>
    )
}