export default function Page(): JSX.Element {
    return (
        <div>
            <h1>Hanneunggeom Frontend</h1>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
    );
}
