import { redirect } from "next/navigation";

export default function MyPageRoot() {
    redirect("/mypage/profile");
}
