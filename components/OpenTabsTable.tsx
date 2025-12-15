import { useContext, useRef } from "react"
import { ShadowContext } from "@/contexts"
import OpenTabList from "./OpenTabList"

export default function OpenTabsTable({
  tabs,
  readerUrl,
}) {

  const articleHostRef = useRef(null)
  const { shadow } = useContext(ShadowContext)

  useEffect(()=>{
      if (articleHostRef.current !== null && shadow.current === null) {
        shadow.current = articleHostRef.current.attachShadow({ mode: "open" });
      }
      console.log(shadow.current,articleHostRef.current)
  })

  return (<div className='w-screen md:w-7/10 overflow-auto'>
    <div hidden ref={articleHostRef} id="articleHost"></div>
    <table className='table-fixed md:table-auto w-full' >
      <thead className='text-left text-sans text-xs'><tr>
        <th className='p-2 w-3/10'></th>
        <th className='p-2 w-1/10 text-right'></th>
        <th className='w-1/10'></th>
      </tr></thead>
      <tbody className='text-left'>
        <OpenTabList
          articleHostRef={articleHostRef}
          tabs={tabs}
          readerUrl={readerUrl}
          />
      </tbody>
    </table>
  </div>)
}
