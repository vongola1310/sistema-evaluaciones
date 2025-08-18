import Navbar from "./Navbar";

interface MainLayoutProps{
    children:React.ReactNode
}

export default function MainLayout({children}:MainLayoutProps){
    return(
       // ✅ Se eliminó la clase "bg-gray-900"
       <div className="min-h-screen">
         <Navbar />
         {/* ✅ Se eliminó la clase "text-white" */}
         <main>
           {children}
         </main>
       </div> 
    )
}