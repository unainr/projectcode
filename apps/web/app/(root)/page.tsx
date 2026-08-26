import FetchProducts from "@/components/fetchproduct"
import { ImageUploader } from "@/components/image-uploader"
import { ProductForm } from "@/components/product-form"
import { redirect } from "next/navigation"


const HomePage = () => {
  return (
    <div className=" max-w-4xl items-center justify-center min-h-screen py-20">
      <ProductForm/>
      <FetchProducts/>
    </div>
  )
}

export default HomePage
