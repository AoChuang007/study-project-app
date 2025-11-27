// vant ui 库的组件
import {
	Button,
	NavBar,
	Swipe,
	SwipeItem,
	Skeleton,
	SkeletonTitle,
	SkeletonImage,
	SkeletonAvatar,
	SkeletonParagraph,
	Tabbar,
	TabbarItem,
	Icon,
	Tab,
	Tabs,
	Empty,
	Sidebar,
	SidebarItem,
	IndexBar,
	IndexAnchor,
	Cell,
	CellGroup,
	Loading,
	ShareSheet,
	ImagePreview,
	ActionBar,
	ActionBarIcon,
	ActionBarButton,
	Popup,
	Lazyload,
	NumberKeyboard,
} from 'vant';

// vant ui 库的组件 - 注册全局组件
export function registerGlobComp(app) {
	// compList.forEach((comp) => {
	// 	app.component(comp.name, comp);
	// });

	app.use(Button)
		.use(NavBar)
		.use(Swipe)
		.use(SwipeItem)
		.use(Skeleton)
		.use(SkeletonTitle)
		.use(SkeletonImage)
		.use(SkeletonAvatar)
		.use(SkeletonParagraph)
		.use(Tabbar)
		.use(TabbarItem)
		.use(Icon)
		.use(Tab)
		.use(Tabs)
		.use(Popup)
		.use(Empty)
		.use(Sidebar)
		.use(SidebarItem)
		.use(IndexBar)
		.use(IndexAnchor)
		.use(Cell)
		.use(CellGroup)
		.use(Loading)
		.use(ShareSheet)
		.use(ImagePreview)
		.use(ActionBar)
		.use(ActionBarIcon)
		.use(ActionBarButton)
		.use(Lazyload)
		.use(NumberKeyboard)

}
