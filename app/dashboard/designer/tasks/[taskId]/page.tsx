import DesignerTaskDetailsPage from "../../components/DesignerTaskDetailsPage";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { taskId } = await params;

  return <DesignerTaskDetailsPage taskId={taskId} />;
}
