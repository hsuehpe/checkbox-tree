import { useState } from "react";
import TreeView from "./components/TreeView";
import { nodes } from "./components/nodes";
import "./App.css";

function App() {
	const [checked, setChecked] = useState<string[]>(["cat", "mars"]);
	const [expanded, setExpanded] = useState<string[]>(["mars"]);

	return (
		<div>
			<TreeView
				checked={checked}
				expanded={expanded}
				nodes={nodes}
				onCheck={setChecked}
				onExpand={setExpanded}
			/>
			<br />
			<h2>checked array</h2>
			<div>{JSON.stringify(checked)}</div>
		</div>
	);
}

export default App;
