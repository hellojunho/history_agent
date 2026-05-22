export function getMaskedNickname(email: string, role: string): string {
    if (role === "admin") {
        return "관리자";
    }
    const parts = email.split("@");
    const localPart = parts[0] || "";
    const len = localPart.length;
    const maskLen = Math.floor(len / 2);
    const visibleLen = len - maskLen;
    return localPart.substring(0, visibleLen) + "*".repeat(maskLen);
}

export function logEmailAlarm(toEmail: string, nickname: string, type: "inquiry_comment" | "comment_reply" | "tag", targetTitle: string) {
    console.log(`\n=================== [EMAIL ALARM] ===================`);
    console.log(`To: ${toEmail} (${nickname})`);
    if (type === "inquiry_comment") {
        console.log(`Message: 귀하의 문의글 "${targetTitle}"에 새로운 답변(댓글)이 등록되었습니다.`);
    } else if (type === "comment_reply") {
        console.log(`Message: 귀하의 댓글에 새로운 답글이 등록되었습니다. ("${targetTitle}")`);
    } else {
        console.log(`Message: 귀하가 "${targetTitle}" 게시글/댓글에서 태그되었습니다.`);
    }
    console.log(`Sent At: ${new Date().toISOString()}`);
    console.log(`=====================================================\n`);
}
