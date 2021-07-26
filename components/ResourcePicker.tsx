import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Common, Renderer } from '@k8slens/extensions';

export interface ResourcePickerProps {
}

interface State {
}

class Resource {
  public constructor(
    public selfLink: string,
    public label: string
  )
  {

  }

  toString()
  {
    return this.label;
  }
}

@observer
export class ResourcePicker extends React.Component<ResourcePickerProps, State> {
  @observable menuIsOpen = true;
  @observable isLoaded = false;
  @observable searchValue: any = undefined;
  @observable data: State;

  state: Readonly<State> = {

  };

  protected namespaceStore = (Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as unknown) as Renderer.K8sApi.NamespaceStore;
  protected podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;
  protected deploymentStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi) as Renderer.K8sApi.DeploymentStore;
  protected statefulsetStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.statefulSetApi) as Renderer.K8sApi.StatefulSetStore;
  protected daemonsetStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.daemonSetApi) as Renderer.K8sApi.DaemonSetStore;
  protected secretStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi) as Renderer.K8sApi.SecretsStore;
  protected serviceStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi) as Renderer.K8sApi.ServiceStore;
  protected pvcStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.pvcApi) as Renderer.K8sApi.VolumeClaimStore;
  protected ingressStore =  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.ingressApi) as Renderer.K8sApi.IngressStore;
  protected configMapStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.configMapApi) as Renderer.K8sApi.ConfigMapsStore;

  constructor(props: ResourcePickerProps) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount()
  {
    this.setState(this.state);
    await this.loadData();
  }
  
  private kubeObjectStores: Renderer.K8sApi.KubeObjectStore[] = [
    this.podsStore,
    this.deploymentStore,
    this.statefulsetStore,
    this.daemonsetStore,
    this.serviceStore,
    this.ingressStore,
    this.pvcStore,
    this.configMapStore,
    this.secretStore,
  ];
  private watchDisposers: Function[] = [];

  protected unsubscribeStores() {
    this.watchDisposers.forEach(dispose => dispose());
    this.watchDisposers.length = 0;
  }

  protected async loadData() {
    this.unsubscribeStores();
    for (const store of this.kubeObjectStores) {
      try {
        if(!store.isLoaded) {
          await store.loadAll();
        }
        const unsuscribe = store.subscribe();
        this.watchDisposers.push(unsuscribe);
      } catch (error) {
        console.error("loading store error", error);
      }
    }
    this.isLoaded = true;
  }

  @computed get options() {
    if (!this.isLoaded)
    {
      return [];
    }

    let result = this.kubeObjectStores
      .flatMap(s => s.getItems().map(i => ({
        value: new Resource(i.selfLink, `${s.api.kind} ${i.metadata.namespace} ${i.getName()}`),
        label: <div><small>({s.api.kind})</small> {i.metadata.namespace} / <strong>{i.getName()}</strong></div>,
      })))
      // .sort((a, b) => a.label > b.label ? 1 : -1);
    return result;
  }

  private onChange(value: Resource) {
    Renderer.Navigation.navigate(Renderer.Navigation.getDetailsUrl(value.selfLink));
  }

  render() {
    return (
      <Renderer.Component.Select
        menuPortalTarget={null}
        onChange={v => this.onChange(v.value)}
        components={{
          DropdownIndicator: null,
          IndicatorSeparator: null,
        }}
        menuIsOpen={this.menuIsOpen}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="Search for a resource&hellip;"
        onInputChange={(newValue, { action }) => {
          if (action === "input-change") {
            this.searchValue = newValue;
          }
        }}
        inputValue={this.searchValue}
      />
    );
  }
}