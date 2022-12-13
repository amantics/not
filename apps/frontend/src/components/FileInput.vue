<template>
  <div class="input">
    <div
      v-bind="getRootProps()"
      class="drop"
      :class="[isDragActive && 'drop--focused']"
    >
      <input v-bind="getInputProps()" />
      <span class="icon">
        <ion-icon name="document"></ion-icon>
        <span class="max"
          >Fichier Maximum: {{ maxFiles ?? "illimité" }}</span
        ></span
      >
      <p v-if="isDragActive" class="text">Déposez les fichiers ici ...</p>
      <p v-else class="text">
        Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des
        fichiers.
      </p>
    </div>
    <div class="files" v-if="showList">
      <div
        v-for="(file, index) in [modelValue].flat(Infinity).filter((v) => !!v)"
        :key="file.name + index"
        class="file"
        :class="[loading && 'file--loading']"
      >
        <span class="extension">.{{ file.name.match(/[^.]+$/)[0] }}</span>
        <div class="main">
          <p class="name">{{ file.name }}</p>
          <span class="size">{{ size(file.size) }}</span>
        </div>
        <span @click="removeFile(file)" class="remove"
          ><ion-icon name="trash-outline"></ion-icon
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useDropzone } from "vue3-dropzone";
import { FileUploadOptions } from "vue3-dropzone/dist/useDropzone";
import fileSize from "filesize";
import { IPFS_TOKEN } from "@/utils/constants";
//@ts-ignore
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import { CIDString } from "web3.storage";
import { ref } from "vue";

interface Props extends FileUploadOptions {
  modelValue: File[];
}

export default {
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    maxFiles: {
      type: Number,
    },
    showList: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: Props, { emit, expose }: any) {
    const onDrop: FileUploadOptions["onDrop"] = (
      acceptFiles,
      rejectReasons
    ) => {
      if (!acceptFiles.length) return;
      // todo handling to error
      addFiles(acceptFiles);
    };
    const dropzoneConfig = useDropzone({
      ...props,
      onDrop: props.onDrop ?? onDrop,
    });
    const removeFile = (file: any) => {
      if (props.maxFiles === 1) {
        return emit("update:modelValue", null);
      }
      emit(
        "update:modelValue",
        props.modelValue.filter((f) => f !== file)
      );
    };
    const addFiles = (files: any[]) => {
      if (props.maxFiles === 1) {
        return emit("update:modelValue", files[0]);
      }
      emit("update:modelValue", [
        ...files,
        ...props.modelValue.slice(
          0,
          props.maxFiles !== undefined
            ? props.maxFiles - files.length
            : undefined
        ),
      ]);
    };

    const loading = ref(false);

    const uploadFiles = async () => {
      if (![props.modelValue].flat(Infinity).filter((v) => !!v).length) return;
      const client = new Web3Storage({ token: IPFS_TOKEN });
      const onRootCidReady = (rootCid: CIDString) =>
        console.log("root cid:", rootCid);
      const onStoredChunk = (chunkSize: number) =>
        console.log(`stored chunk of ${chunkSize} bytes`);
      loading.value = true;
      const rootCid: CIDString = await client.put(
        [props.modelValue].flat(Infinity).filter((v) => !!v),
        {
          onRootCidReady,
          onStoredChunk,
        }
      );
      const res = await client.get(rootCid);
      const files: any[] = await res.files();
      const cids = files.map((file) =>
        JSON.stringify({
          name: file.name,
          cid: file.cid,
          rootCid,
          path: file.path,
        })
      );
      loading.value = false;
      return props.maxFiles === 1 ? cids[0] : cids;
    };

    const size = fileSize.partial({ base: 2, standard: "jedec" });
    expose({
      uploadFiles,
      loading,
    });

    return {
      ...dropzoneConfig,
      removeFile,
      uploadFiles,
      loading,
      size,
    };
  },
};
</script>

<style scoped lang="scss">
.files {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .file {
    display: flex;
    gap: 1rem;
    font-size: 1.4rem;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background-color: $secondary-bg-hover-color;
    }

    @keyframes load {
      0% {
        left: 0;
        width: 0;
        right: unset;
      }
      50% {
        left: 0;
        right: unset;
        width: 100%;
      }
      51% {
        right: 0;
        left: unset;
        width: 100%;
      }
      100% {
        width: 0;
        right: 0;
        left: unset;
      }
    }

    &--loading {
      position: relative;

      &:after {
        position: absolute;
        display: inline-block;
        content: "";
        height: 0.2rem;
        top: 100%;
        background-color: $line-color;
        animation: load 1.2s forwards infinite;
      }
    }

    .extension {
      padding: 1.5rem 1.5rem;
      font-size: 1.4rem;
      color: rgba($primary-text-color, 0.5);
      border-radius: 0.5rem;
      background-color: $secondary-bg-color;
    }

    .main {
      font-size: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .size {
        opacity: 0.5;
        font-size: 1.2rem;
      }
    }

    .remove {
      margin-left: auto;
      opacity: 0.5;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.input {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .drop {
    border: 1px dashed;
    border-color: $line-color;
    padding: 2rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    transition: all 0.2s ease;
    color: rgba($primary-text-color, 0.5);

    &--focused,
    &:hover {
      border-color: $primary-color;

      .icon {
        & > *:nth-child(1) {
          opacity: 1;
          color: $primary-color;
        }
      }
    }

    .text {
      font-size: 1.2rem;
      opacity: 0.5;
    }

    .icon {
      font-size: 3rem;
      opacity: 0.5;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      .max {
        font-size: 1.2rem;
      }
    }
  }
}
</style>
