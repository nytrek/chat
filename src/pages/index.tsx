import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Image, { ImageProps } from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { socket } from "../socket";

interface Message {
  name: string;
  message: string;
}

//https://github.com/vercel/next.js/discussions/26168#discussioncomment-1863742
function BlurImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true);
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
      <Image
        {...props}
        alt={props.alt}
        className={clsx(
          props.className,
          "h-8 w-8 rounded-full bg-gray-800 duration-700 ease-in-out",
          isLoading
            ? "scale-110 blur-sm grayscale"
            : "scale-100 blur-0 grayscale-0"
        )}
        fill
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { register, handleSubmit } = useForm<Message>();
  const onSubmit: SubmitHandler<Message> = (data) => {
    const { message } = data;
    isConnected && socket.emit("newMessage", message);
  };
  const connect = () => {
    socket.connect();
    setIsConnected(true);
  };
  const disconnect = () => {
    socket.disconnect();
    setIsConnected(false);
  };
  useEffect(() => {
    connect();
    socket.on("onMessage", (data) =>
      setMessages((messages) => [
        ...messages,
        { message: data, name: "Kenny Tran" },
      ])
    );
    return () => {
      socket.off("connect");
      socket.off("onMessage");
    };
  }, []);
  //https://medium.com/@romeobazil/share-auth-session-between-nextjs-multi-zones-apps-using-nextauth-js-5bab51bb7e31
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => router.push("/"),
  });
  if (status === "loading") {
    return <span>Loading...</span>;
  }
  return (
    <div className="mx-auto flow-root max-w-lg px-4 py-4 sm:px-6 sm:py-6">
      <div className="relative h-[70vh] rounded-md bg-gray-800/40">
        <div className="flex h-[6.5vh] items-center justify-between rounded-t-md bg-gray-800 px-6 text-white">
          <div className="flex items-center space-x-2">
            <div className="relative flex-none rounded-full p-1">
              <div
                className={clsx(
                  isConnected ? "bg-green-400" : "bg-gray-400",
                  "h-2 w-2 rounded-full"
                )}
              />
              <div
                className={clsx(
                  isConnected && "bg-green-400 motion-safe:animate-ping",
                  "absolute top-1 h-2 w-2 rounded-full"
                )}
              />
            </div>
            <p>{isConnected ? "Connected" : "Not Connected"}</p>
          </div>
          {isConnected ? (
            <button type="button" onClick={disconnect}>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          ) : (
            <button type="button" onClick={connect}>
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <ul
          role="list"
          className="h-full max-h-[63.5vh] overflow-y-auto px-6 pb-24"
        >
          {messages.map((item, index) => (
            <li key={index}>
              <div className="relative py-6">
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <BlurImage
                      src={
                        "https://api.dicebear.com/6.x/avataaars/svg?seed=" +
                        index
                      }
                      alt="avatar"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <h4 className="font-medium text-white">{item.name}</h4>
                      </div>
                    </div>
                    <div className="mt-0.5 text-sm text-gray-400">
                      <p>{item.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="absolute bottom-0 left-0 w-full"
        >
          <input
            type="text"
            id="message"
            {...register("message")}
            className="h-[6.5vh] w-full rounded-b-md bg-gray-800 px-6 text-white outline-none"
            placeholder="Type a message..."
            required
          />
        </form>
      </div>
    </div>
  );
}
