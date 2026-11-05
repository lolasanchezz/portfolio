import Image from "next/image";
import Link from "next/link";
import AsciiDancer from "./components/AsciiDancer";
import Donut from "./components/Donut";
import Globe from "./components/Globe";
import { Tags } from "./components/Cards";
import { formatDate, getPosts, getProjects, getSite } from "./data";
import styles from "./page.module.css";

// one big screen of dancers + the name, then work as a sideways strip and writing as a full-width list,
// then contact
export default async function Main() {
  const site = await getSite();
  const projects = (await getProjects()).sort(
    (a, b) => Number(b.favorite) - Number(a.favorite),
  );
  const posts = await getPosts();

  return (
    <div className={styles.page}>
      <section className={styles.poster} data-snap>
        {/* each dancer starts on a different frame so they're out of sync */}
        <div className={styles.dancers}>
          {[0, 120].map((offset) => (
            <AsciiDancer
              key={offset}
              offset={offset}
              className={styles.dancer}
            />
          ))}
        </div>
        <p className={styles.greeting}>{site.greeting}</p>
        <h1>{site.name}</h1>
        <p className={styles.headline}>
          {site.headline.text}{" "}
          <a href={site.headline.link.href}>{site.headline.link.text}</a>
          <br />
          <span>{site.about.join(" · ")}</span>
        </p>
        <nav className={styles.cue}>
          <a href="#work">↓ work</a>
          {posts.length > 0 && <a href="#writing">↓ writing</a>}
          <a href="#contact">↓ contact</a>
        </nav>
      </section>

      <section id="work" className={styles.section} data-snap>
        <div className={styles.sectionHead}>
          <h2>work</h2>
          <Link href="/projects">all projects &gt;</Link>
        </div>
        <div className={styles.strip} data-lenis-prevent-horizontal>
          {projects.map((proj, i) => {
            const thumb = proj.images[0];
            return (
              <Link
                key={proj.shortname}
                href={`/projects/${proj.shortname}`}
                className={styles.tile}
              >
                <div className={styles.tileTop}>
                  <Tags tags={proj.tags} />
                  <span className={styles.meta}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.frame}>
                  {thumb && (
                    // width/height 0 + height: auto = the image keeps its own shape, whatever the photo is
                    <Image
                      src={`/images/${proj.shortname}/${thumb.src}`}
                      alt={thumb.subtitle}
                      width={0}
                      height={0}
                      sizes="28rem"
                    />
                  )}
                </div>
                <h3 data-crawl>{proj.name}</h3>
                <p>{proj.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* no posts = no writing section at all */}
      {posts.length > 0 && (
        <section id="writing" className={styles.section} data-snap>
          <div className={styles.sectionHead}>
            <h2>writing</h2>
            <Link href="/blog">all posts &gt;</Link>
          </div>
          <ul className={styles.posts}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  <div>
                    <h3 data-crawl>{post.title}</h3>
                    <p>{post.desc}</p>
                  </div>
                  <span>
                    {formatDate(post.date)}
                    {post.draft && " · draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer id="contact" className={styles.contact} data-snap>
        <div>
          <h2>say hi</h2>
          <ul>
            {site.contact.map((c) => (
              <li key={c.label}>
                <a href={c.href} data-crawl>
                  {c.text}
                </a>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* the dotted donut + globe from the old site, tucked in the bottom right */}
        <div className={styles.shapes}>
          <Donut size={220} />
          <Globe size={220} />
        </div>
      </footer>
    </div>
  );
}
