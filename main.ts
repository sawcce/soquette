type Child = ComponentInvocation<any> | Node

interface Node {
	tag: string
	props: Record<string, string>
	children: Child[] | Child | string
}

const el = (
	tag: string,
	props: Record<string, string>,
	children: Child[] | Child | string = []
): Node => ({
	tag,
	props,
	children,
})

function renderUnit(unit: Child) {
	if (Object.hasOwn(unit, 'id')) {
		const invocation = unit as ComponentInvocation<Record<string, unknown>>
		return render(
			invocation.render({ ...invocation.state, ...invocation.props })
		)
	} else {
		return render(unit as Node)
	}
}

function render(node: Node) {
	const start = `<${node.tag}${Object.entries(node.props).map(
		([key, value]) => ` ${key}="${value}"`
	)}>`

	const end = `</${node.tag}>`

	let middle = ''

	if (typeof node.children == 'string') {
		middle = node.children
	} else if (node.children instanceof Array) {
		middle = node.children.map((n) => renderUnit(n)).join(' ')
	} else {
		middle = renderUnit(node.children)
	}
	return start + middle + end
}

type ComponentInvocation<T> = {
	id: string
	state: T
	props: T
	render: (s: T) => Node
}

function Component<T>(
	state: T,
	render: (s: T) => Node
): (_?: T) => ComponentInvocation<T> {
	const id = crypto.randomUUID()

	return (props: T = state) => ({
		id,
		state,
		props,
		render,
	})
}

const Greet = Component(
	{
		name: 'world',
	} as { name?: string },
	({ name }) => el('h1', {}, `Hello, ${name}!`)
)

const tree = el('html', { lang: 'en' }, [el('body', {}, [Greet()])])
console.log(tree)

const page = render(tree)
console.log(page)
