//define interface for PageParams props
export interface PageParamsProps {
  params: Promise<{ id: number }>;
}

// Fetch the data based on the provided 'id' prop
export interface IdProps {
  id: number;
};