"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading graph visualization...</div>
  }
);

interface GraphNode {
  id: string;
  label: string;
  type: 'disease' | 'symptom';
  properties: any;
  is_input?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  properties: any;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphVisualizationProps {
  graphData: GraphData | null;
  isLoading: boolean;
}

export default function GraphVisualization({ graphData, isLoading }: GraphVisualizationProps) {
  const graphRef = useRef<any>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server
  if (!isClient) {
    return (
      <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing symptoms...</p>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Knowledge Graph Visualization</h3>
        <p className="text-gray-600 mb-1">Submit symptoms to visualize disease relationships</p>
        <p className="text-gray-500 text-sm">The graph will show connections between diseases and symptoms</p>
      </div>
    );
  }

  // Prepare data for force graph
  const graphNodes = graphData.nodes.map(node => ({
    id: node.id,
    name: node.label,
    type: node.type,
    isInput: node.is_input || false,
    val: node.type === 'disease' ? 10 : 5,
    ...node.properties
  }));

  const graphLinks = graphData.links.map(link => ({
    source: link.source,
    target: link.target,
    relationship: link.relationship,
    ...link.properties
  }));

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes: graphNodes, links: graphLinks }}
        width={800}
        height={600}
        nodeLabel={node => `
          ${node.name}
          Type: ${node.type}
          ${node.severity ? `Severity: ${node.severity}` : ''}
          ${node.frequency ? `Frequency: ${node.frequency}` : ''}
          ${node.emergency ? '⚠️ EMERGENCY' : ''}
        `}
        nodeColor={node => {
          if (node.type === 'disease') {
            return node.emergency ? '#dc2626' : '#ef4444';
          }
          if (node.isInput) return '#10b981';
          return '#3b82f6';
        }}
        nodeRelSize={6}
        linkColor={() => 'rgba(160, 174, 192, 0.6)'}
        linkWidth={link => link.severity || 1}
        linkLabel={link => `Relationship: ${link.relationship}`}
        onNodeClick={(node, event) => {
          if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2, 1000);
          }
        }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
        <div className="font-semibold text-gray-800 mb-2 text-sm">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Disease</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Your Symptoms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Related Symptoms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-700"></div>
            <span className="text-xs">Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}