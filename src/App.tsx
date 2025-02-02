import { useState } from "react";
import TreeView from "./components/TreeView";
import { nodes } from "./components/nodes";
import "./App.css";

function App() {
  const [checked, setChecked] = useState<string[]>([]);
  const [_, setExpanded] = useState<string[]>([]);

  return (
    <div>
      <TreeView nodes={nodes} onCheck={setChecked} onExpand={setExpanded} />
      <br />
      <h2>checked array</h2>
      <div>{JSON.stringify(checked)}</div>
    </div>
  );
}

export default App;
