import List from "@/components/ItemDisplay/List"
import ImageItem from "@/components/ItemDisplay/ImageItem"

const Group = () => {
    return <div className="flex flex-col">
        <List name="List">
            <h1></h1>
            {/*
            {testList.map(meow => (
               <ImageItem key={Math.random()} /> 
            ))} 
            */}  
        </List>
    </div>
}

export default Group