import { useTRPC } from "@/trpc/client";

const Page = () => {
  const trpc = useTRPC();
  trpc.createAI.queryOptions( {text: "Hello!"})

  //localhost:3000/api/trpc/create-ai?body={"text":"hello!"}

    return (
        <div>
          Hello World
        </div>
    );
};
export default Page;