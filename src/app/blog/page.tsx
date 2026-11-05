import Banner from "../components/Banner";
import { PostRow } from "../components/Cards";
import { getPosts } from "../data";
import styles from "./blog.module.css";

export default async function Blog() {
  const posts = await getPosts();
  return (
    <div className={styles.page}>
      <Banner compact title="blogs" subtitle="notes + writing" back={{ href: "/", text: "home" }} />
      <div className={styles.list}>
        {posts.length ? (
          posts.map((post) => <PostRow key={post.slug} post={post} />)
        ) : (
          <p className={styles.empty}>nothing here yet - check back soon</p>
        )}
      </div>
    </div>
  );
}
