import { redirect } from 'next/navigation';


export default async function Page({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  if (project === "boids") {
    console.log("Redirect")
    redirect("https://3d-boids.vercel.app")
  } else {
    redirect("/")
  }

}