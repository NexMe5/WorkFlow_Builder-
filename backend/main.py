from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineRequest(BaseModel):
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)


def is_directed_acyclic_graph(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
    adjacency = {}

    for node in nodes:
        node_id = node.get("id")
        if node_id:
            adjacency.setdefault(node_id, [])

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")

        if not source or not target:
            continue

        adjacency.setdefault(source, []).append(target)
        adjacency.setdefault(target, [])

    visit_state = {}

    def visit(node_id: str) -> bool:
        state = visit_state.get(node_id)

        if state == "visiting":
            return False

        if state == "visited":
            return True

        visit_state[node_id] = "visiting"

        for neighbor in adjacency.get(node_id, []):
            if not visit(neighbor):
                return False

        visit_state[node_id] = "visited"
        return True

    return all(visit(node_id) for node_id in adjacency)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineRequest):
    return {
        'num_nodes': len(pipeline.nodes),
        'num_edges': len(pipeline.edges),
        'is_dag': is_directed_acyclic_graph(pipeline.nodes, pipeline.edges),
    }
