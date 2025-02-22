import styles from './arrow-button.module.css'

type Props = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
};

export const ArrowButton = ({ visible, setVisible }: Props) => {

    return (
        <div className={`${styles.parent}`} onClick={() => {
            setVisible((visible: boolean) => !visible);
        }} style={{ cursor: 'pointer', height: '100%', userSelect: 'none', padding: '10px', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="arrow" checked={visible} className={`${styles.arrowanimation}`} style={{ display: 'none' }} onChange={() => {
                setVisible((visible: boolean) => !visible);
            }} />
            <label className={`${styles.arrowlabel}`} htmlFor="arrow">
                <div className={visible ? `${styles.arrow} ${styles.arrowMoveToLeft} ` : `${styles.arrow} ${styles.arrowMoveToRight} `}></div>
            </label>

        </div>
    )
}