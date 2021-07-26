import { Main } from "@k8slens/extensions";

export class IpcMain extends Main.Ipc
{
    public constructor(extension: ResourceSearchMain)
    {
        super(extension);
    }
}

export default class ResourceSearchMain extends Main.LensExtension {
    appMenus = [
        {
          parentId: 'view',
          label: "Search for Resource...",
          accelerator: "CmdOrCtrl+P",
          click: () => {
              IpcMain.getInstance().broadcast(`search-for-resource:menu-item`);
          },
        },
      ];

      onActivate()
      {
          IpcMain.createInstance(this);
      }
}
