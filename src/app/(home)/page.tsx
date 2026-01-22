import { HomeView } from "@/modules/home/ui/views/home-view";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId } = await auth();
  return <HomeView userId={userId} />;
};

export default Page;