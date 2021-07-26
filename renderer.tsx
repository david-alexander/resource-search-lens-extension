import React from "react"
import { Renderer } from "@k8slens/extensions";
import { ResourcePicker } from "./components"
import { CommandRegistration } from "@k8slens/extensions/dist/src/extensions/registries";

class IpcRenderer extends Renderer.Ipc
{
  constructor(extension: ResourceSearchRenderer)
  {
    super(extension);

    if (location.hostname == "localhost")
    {
      this.listen('search-for-resource:menu-item', (e: any) => {
        console.log(Renderer.Catalog.catalogEntities.activeEntity.getId());
          this.broadcast(`search-for-resource:${Renderer.Catalog.catalogEntities.activeEntity.getId()}`);
      });
    }
    else
    {
      let clusterId = location.hostname.split('.')[0];
      this.listen(`search-for-resource:${clusterId}`, (e: any) => {
        Renderer.Component.CommandOverlay.open(<ResourcePicker />);
      });
    }
  }
}

export default class ResourceSearchRenderer extends Renderer.LensExtension {
  onActivate()
  {
    IpcRenderer.createInstance(this);
  }
}
