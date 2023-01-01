import { Tool } from './types'

enum ToolId {
  CURSOR = 0,
  ADD_POINT = 1,
}

const tools: Tool[] = [
  { id: ToolId.CURSOR, name: 'Cursor' },
  { id: ToolId.ADD_POINT, name: 'Add Point' },
]

export { tools, ToolId }
