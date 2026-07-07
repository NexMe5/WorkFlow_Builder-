import unittest

from main import PipelineRequest, is_directed_acyclic_graph, parse_pipeline


class PipelineParserTests(unittest.TestCase):
    def test_acyclic_pipeline(self):
        nodes = [{"id": "input"}, {"id": "output"}]
        edges = [{"source": "input", "target": "output"}]

        self.assertTrue(is_directed_acyclic_graph(nodes, edges))
        self.assertEqual(
            parse_pipeline(PipelineRequest(nodes=nodes, edges=edges)),
            {"num_nodes": 2, "num_edges": 1, "is_dag": True},
        )

    def test_cyclic_pipeline(self):
        nodes = [{"id": "first"}, {"id": "second"}]
        edges = [
            {"source": "first", "target": "second"},
            {"source": "second", "target": "first"},
        ]

        self.assertFalse(is_directed_acyclic_graph(nodes, edges))


if __name__ == "__main__":
    unittest.main()
