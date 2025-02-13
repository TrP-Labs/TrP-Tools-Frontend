import TopBarComponent from "./TopBarComponent"
import LogoTopBarComponent from "./LogoTopBarComponent"
import LoggedInUser from "./LoggedInUser"

const TopBar = () => {
    return <div className="fixed w-screen h-16 top-0 bg-[#272727] flex flex-row items-center shadow-md select-none">
        <div className="flex flex-row items-center">
            <LogoTopBarComponent src='https://static.trptools.com/icon.webp' href="/" />
            <TopBarComponent href="/groups">Groups</TopBarComponent>
            <TopBarComponent href="/shifts">Shifts</TopBarComponent>
            <TopBarComponent href="/tools">Tools</TopBarComponent>
            <TopBarComponent href="/dashboard">Dashboard</TopBarComponent>
            <TopBarComponent href="https://trolleybus.wiki">Wiki</TopBarComponent>
        </div>
        <div className="flex flew-row items-center ml-auto mr-3">
            <LoggedInUser />
        </div>
    </div>
}

export default TopBar