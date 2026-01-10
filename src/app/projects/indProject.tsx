import styles from './indProject.module.css'

const Header = (props: {name: string, gh: string, demo: string, backFunc: any}) => {
    return (
        <div className = {styles.headerCont}>
            <p onClick = {() => {props.backFunc(null)}}>x</p>
        <div className = {styles.header}>    
            <h1 style = {{textDecoration: 'underline'}}>{props.name}</h1>
            <div className = {styles.linkCont}>
                <p>links</p>
            <div className = {styles.smallLinkCont}>
                <a href={props.gh}>github</a>
                <a href={props.demo}>demo</a>
                </div>
            </div>
        </div>
        </div>
    )
}




export const SecProject = (props: {goBackFunc: any}) => {
    console.log(props.goBackFunc)
    return (
        <div className = {styles.projContainer}>
           <Header backFunc = {props.goBackFunc} name="graph the sec" gh="link" demo="link"/>
            <div className = {styles.imagesCont}>
                
            </div>
        </div>
    )
}


export const SecondProject = () => {
    return (
<div></div>    )
}


