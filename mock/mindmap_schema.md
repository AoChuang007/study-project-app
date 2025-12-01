# 脑图数据字段说明（Mock 数据模式）

以下文档列出用于生成脑图的输入数据字段及其含义，同时给出 MindMapNode 转换后（可视化）对象的字段说明。

## 输入字段（Input）

| 字段       |                      类型 |           是否必填 | 说明                                                                                                       | 示例                                 |
| ---------- | ------------------------: | -----------------: | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `data`     | Array \/ Object \/ string | 否（可选外层容器） | 最外层容器；可以是 `{ "data": [ ... ] }`，也可以直接传入数组或 JSON 字符串。MindMapNode 支持字符串或对象。 | `{ "data": [ { ... } ] }` 或 `[...]` |
| `id`       |                    string |                 是 | 条目唯一标识，用于生成节点 id（例如 `item_{id}`）。                                                        | `"101"`                              |
| `type`     |                    string |                 是 | 条目分组/类别（如：基础、进阶、框架）。MindMapNode 会按 `type` 分组生成一级节点。                          | `"基础"`                             |
| `title`    |                    string |                 是 | 条目的主标题，用作脑图节点文本。                                                                           | `"Java 基础语法"`                    |
| `level`    |                    string |                 否 | 难度或级别，会生成子节点 `级别: {level}`。                                                                 | `"入门"`                             |
| `duration` |                    string |                 否 | 建议学习时长，会生成子节点 `时长: {duration}`。                                                            | `"4周"`                              |
| `content`  |                    string |                 否 | 简短描述/摘要，会生成子节点 `内容: {content}`。                                                            | `"变量、数据类型、流程控制"`         |
| `steps`    |             Array[string] |                 否 | 学习步骤数组，会被放入 `学习步骤` 子节点，数组中每项作为子节点项。                                         | `["步骤1","步骤2"]`                  |
| 其他字段   |                       any |                 否 | 任意额外字段不会破坏转换逻辑，但默认不会渲染。可在前端扩展逻辑后使用。                                     | `"tags": ["后端","入门"]`            |

## 转换后（MindMapNode 输出 - visualization / mindMapData）

MindMapNode.calculate() 会输出两个相关字段：`visualization`（对象）和 `mindMapData`（JSON 字符串）。主要结构如下：

| 字段       |          类型 | 说明                                                                       | 示例                              |
| ---------- | ------------: | -------------------------------------------------------------------------- | --------------------------------- |
| `id`       |        string | 节点唯一 id（如 `root`, `type_{type}`, `item_{id}`）。                     | `"root"` / `"type_基础"`          |
| `topic`    |        string | 节点显示文本（根节点是整体标题，类型节点会包含计数）。                     | `"Java学习路线"` / `"基础 (2条)"` |
| `children` | Array[object] | 子节点数组，递归结构。每个 child 同样包含 `id`、`topic`、可选 `children`。 | 参见下方示例                      |

### 示例（可视化对象）

```json
{
  "id": "root",
  "topic": "Java学习路线",
  "children": [
    {
      "id": "type_基础",
      "topic": "基础 (1条)",
      "children": [
        {
          "id": "item_101",
          "topic": "Java 基础语法",
          "children": [
            { "id": "level_101", "topic": "级别: 入门" },
            { "id": "duration_101", "topic": "时长: 4周" },
            { "id": "content_101", "topic": "内容: 变量、数据类型" },
            {
              "id": "steps_101",
              "topic": "学习步骤",
              "children": [{ "id": "step_101_0", "topic": "学习变量与类型" }]
            }
          ]
        }
      ]
    }
  ]
}
```

## 备注与建议

- 根节点 `topic` 当前在 `MindMapNode` 中默认是 `"Java学习路线"`，如需动态标题可将 `calculate` 中读取 `parsedData.title` 或其他字段替代硬编码值。
- 如果后端返回字段名称不同（例如 `name` 替代 `title`），建议在前端统一映射转换层（`MindMapNode.calculate()`）中做适配。
- 你可以把此文件用于前端 mock 或后端接口文档；若需要我可以额外创建一个 `mock/mindmap.json` 或 `mock/mindmap.js` 返回示例数据以供本地调试。

---

文件路径：`mock/mindmap_schema.md`
