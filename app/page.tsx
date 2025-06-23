import Image from "next/image";
import ImageUpload from './components/main'
import ImageDetectionViewer from "./components/main";
import Home from './components/Home'

export default function page() {
  return (
    <>
      <ImageDetectionViewer/>
      <Home/>
    </>
  );
}
