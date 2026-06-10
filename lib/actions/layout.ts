"use server";

export async function getLayoutSetting(): Promise<{
  success: boolean;
  data?: { layoutMode: "classic" };
  message?: string;
}> {
  return { success: true, data: { layoutMode: "classic" } };
}

export async function setLayoutSettingAction(): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "OK" };
}
