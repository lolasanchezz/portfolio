import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import Banner from "../../components/Banner";
import { Tags } from "../../components/Cards";
import { formatDate, getPost, getPosts } from "../../data";
import styles from "../blog.module.css";


export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((o) => ({ post: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ post: string }> }) {
  const post = await getPost((await params).post);
  return post ? { title: `${post.title} - lola sanchez`, description: post.desc } : {};
}

export default async function Post({ params }: { params: Promise<{ post: string }> }) {
  const post = await getPost((await params).post);
  if (!post) notFound();

  return (
    <div className={styles.page}>
      <Banner
        compact
        title={post.title}
        subtitle={formatDate(post.date)}
        back={{ href: "/blog", text: "blogs" }}
      />
      <article className={styles.article}>
        <Tags tags={post.tags} />
        <div className={styles.body}>
          <Markdown>{post.body}</Markdown>
        </div>
      </article>
    </div>
  );
}
