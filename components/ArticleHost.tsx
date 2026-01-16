import { useRef, useContext } from "react";
import { ShadowContext } from "@/contexts";

export const ArticleHost = () => {
  
  const { shadow, articleHostRef } = useContext(ShadowContext)

  useEffect(()=>{
      if (articleHostRef.current !== null && shadow.current === null) {
        shadow.current = articleHostRef.current.attachShadow({ mode: "open" });
      }
      console.log(shadow.current,articleHostRef.current)
  })

  return (<div hidden ref={articleHostRef} id="articleHost"></div>)
}
