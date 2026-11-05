import Link from "next/link";
import AsciiDancer from "./AsciiDancer";
import styles from "./banner.module.css";

// the lavender band at the top of every page - big on home, compact everywhere else.
// `dancers` adds the ascii dancers, sitting behind the title
export default function Banner(props: {
  title: string;
  greeting?: string;
  subtitle?: string;
  back?: { href: string; text: string };
  compact?: boolean;
  dancers?: boolean;
}) {
  return (
    <header
      className={[styles.banner, props.compact && styles.compact, props.dancers && styles.withDancers]
        .filter(Boolean)
        .join(" ")}
    >
      {props.back && (
        <Link href={props.back.href} className={styles.back}>
          &lt; {props.back.text}
        </Link>
      )}
      {props.dancers && (
        // each dancer starts on a different frame so they're out of sync
        <div className={styles.dancers}>
          {[0, 120].map((offset) => (
            <AsciiDancer key={offset} offset={offset} className={styles.dancer} />
          ))}
        </div>
      )}
      <div className={styles.center}>
        {props.greeting && <p className={styles.small}>{props.greeting}</p>}
        <h1>{props.title}</h1>
        {props.subtitle && <p className={styles.small}>{props.subtitle}</p>}
      </div>
    </header>
  );
}
