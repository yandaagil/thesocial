import React, { useEffect, useRef, useState } from "react";
import Title from "@/components/head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Undo2, Globe, Lock, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";
import axios from "axios";
import { createdAt } from "@/Utlis/date";
import EditPost from "@/components/editpost";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import DetailPostLoad from "@/components/skeleton/detailpostload";

interface DetailedPost {
  author: {
    name: string;
    username: string;
    email: string;
    photo_profile: string;
  };
  username: string;
  authorId: number;
  category: string;
  content: string;
  createdAt: string;
  id: number;
  image: string | StaticImport;
  published: boolean;
  title: string;
  updatedAt: string;
}

const DetailedPost = () => {
  const { userData } = useSelector((state: RootState) => state.utils);
  const [detailPost, setDetailPost] = useState<DetailedPost>();
  const myItemRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const { toast } = useToast();
  const id: number | undefined = parseInt(router.query.id as string);

  const baseURL = process.env.NEXT_PUBLIC_API_CALL;

  const getDetailPost = async (id: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseURL}/post/${id}`);
      setDetailPost(res.data);
    } catch (err) {
      console.log(err);
      return router.push("/404")
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (!id) return;
    getDetailPost(id);
  }, [id]);

  const deletePost = async (id?: number) => {
    try {
      await axios.delete(`${baseURL}/post/delete/${id}`);
      if (myItemRef.current) myItemRef.current.click();
      router.push("/")
      toast({
        title: "Post has been deleted!",
        duration: 2500,
      })
    } catch (err) {
      console.log(err)
      toast({
        title: "Failed to delete post!",
        duration: 2500,
      })
    }
  }

  if (isLoading) return <DetailPostLoad />;

  return (
    <>
      <Title title={`@${detailPost?.author.username} Post`} />

      <section>
        <Card>
          <section className="flex flex-col">
            <div className="flex flex-row ml-3 mt-3 items-center sm:ml-6">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button className="rounded-full" size="icon" variant="ghost" onClick={() => router.back()}>
                      <Undo2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Back to Previous Page</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="ml-3">Post</h3>
            </div>
            <CardHeader className="flex flex-row space-y-0 p-3 justify-between sm:p-6">
              <div className="flex flex-row">
                <Avatar className="w-12 h-12 cursor-pointer">
                  <AvatarImage src={detailPost?.author.photo_profile} onClick={() => router.push(`/profile/${detailPost?.authorId}`)} />
                  <AvatarFallback onClick={() => router.push(`/profile/${detailPost?.authorId}`)}>
                    {detailPost?.author.name.split("")[0].toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="ml-3 text-lg hover:underline cursor-pointer" onClick={() => router.push(`/profile/${detailPost?.authorId}`)}>
                    {detailPost?.author.name}
                  </CardTitle>
                  <CardDescription className="ml-3 [&:not(:first-child)]:mt-0 hover:underline cursor-pointer" onClick={() => router.push(`/profile/${detailPost?.authorId}`)}>
                    @{detailPost?.author.username}
                  </CardDescription>
                </div>
              </div>
              {detailPost?.authorId === userData?.userId &&
                <div className="flex flex-row">
                  <EditPost className="mt-0" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="ml-3 rounded-full" size="icon" variant="ghost">
                        <Trash2 className="text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. After you click the post will be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel ref={myItemRef}>Cancel</AlertDialogCancel>
                        <Button variant="destructive" className="w-1/2 sm:w-auto" onClick={() => deletePost(detailPost?.id)}>Delete</Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              }
            </CardHeader>
            <article className="flex flex-col">
              <CardContent className="pt-3">
                <Badge className="mb-3 cursor-default">{detailPost?.category.replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                <h2 className="mb-3">{detailPost?.title}</h2>
                <div className="relative h-96">
                  <Image src={(detailPost?.image as string)?.replace(/\\/g, "/")} className="object-contain" fill={true} alt="image" priority />
                </div>
                <p>{detailPost?.content}</p>
              </CardContent>
            </article>
            <footer className="m-0 px-3 pb-3 flex flex-row items-center sm:px-6 sm:pb-6">
              {detailPost?.published
                ? <Globe className="w-[18px] h-[18px] mr-1 text-muted-foreground" />
                : <Lock className="w-[18px] h-[18px] mr-1 text-muted-foreground" />
              }
              <CardDescription className="[&:not(:first-child)]:mt-0">{createdAt(detailPost?.createdAt)}</CardDescription>
            </footer>
          </section>
        </Card>
      </section>
    </>
  );
};

export default DetailedPost;
