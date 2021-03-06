<template>
  <div class="main">
    <detail-info-card
      :avatar_url="songer.img"
      :name="songer.name"
      :circular="true"
    >
      <template v-slot:name>
        <detail-songer-info
          :name="songer.name"
          :desc="songer.desc"
          :songSize="songer.musicSize"
          :albumSize="songer.albumSize"
          :mvSize="songer.mvSize"
          @moreClick="toggleShowMoreInfo"
        ></detail-songer-info>
      </template>
      <template v-slot:info>
        <func-bar
          exclude="['collection', 'more', 'comment']"
          playBtnName="播放歌手热门歌曲"
          @btnClick="playHotSongs"
        />
      </template>
    </detail-info-card>

    <div id="index_tab">
      <div class="mod_part">
        <div class="part__hd">
          <h2 class="part__tit">热门歌曲</h2>

          <a class="part__more"> 全部<i class="icon_part_arrow sprite"></i> </a>
        </div>

        <detail-songlist :songs="hotSongs" :listType="'songer'" />
      </div>

      <div class="mod_part" v-if="albums.length > 0">
        <div class="part__hd">
          <h2 class="part__tit">专辑</h2>
        </div>
        <div class="mod_playlist">
          <ul class="playlist__list" id="albumlist">
            <li class="playlist__item" v-for="album in albums" :key="album.id">
              <div class="playlist__item_box">
                <div class="playlist__cover mod_cover">
                  <a>
                    <img
                      class="playlist__pic"
                      src="//y.gtimg.cn/mediastyle/global/img/album_300.png?max_age=31536000"
                      v-lazy="album.img"
                      :alt="album.name"
                    />
                    <i
                      class="mod_cover__icon_play"
                      @click="playTheAlbum(album.id)"
                    ></i>
                  </a>
                </div>
                <h4 class="playlist__title">
                  <span class="playlist__title_txt">
                    <a :title="album.name" @click="gotoAlbumDetail(album.id)">{{
                      album.name
                    }}</a>
                  </span>
                </h4>
                <div class="playlist__other">{{ album.publishTime }}</div>
                <a class="btn_operate_menu">
                  <span class="icon_txt">更多</span>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="mod_part" v-if="mvs.length > 0">
        <div class="part__hd">
          <h2 class="part__tit">MV</h2>
          <a class="part__more"> 全部<i class="icon_part_arrow sprite"></i> </a>
        </div>
        <div class="mod_mv">
          <ul class="mv_list__list" id="mvlist">
            <li class="mv_list__item" v-for="mv in mvs" :key="mv.id">
              <div class="mv_list__item_box">
                <a class="mv_list__cover mod_cover" hidefocus="true">
                  <img
                    class="mv_list__pic"
                    src="//y.gtimg.cn/mediastyle/global/img/mv_300.png?max_age=31536000"
                    v-lazy="mv.img"
                    :alt="mv.name"
                  />
                  <i class="mod_cover__icon_play"></i>
                </a>
                <h3 class="mv_list__title">
                  <a :title="mv.name">{{ mv.name }}</a>
                </h3>

                <div class="mv_list__info">
                  <span class="mv_list__listen"
                    ><i class="mv_list__listen_icon sprite"></i
                    >{{ mv.playCount }}</span
                  >
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <info-list
        :title="'相似歌手'"
        :items="simiSongers"
        @btnClick="songerClick"
        v-if="simiSongers.length > 0"
      />
    </div>

    <div
      class="popup_data_detail"
      id="popup_data_detail"
      data-aria="popup"
      style="z-index: 2147483647"
      :style="{ display: moreInfo ? '' : 'none' }"
      v-if="songer.desc"
    >
      <div class="popup_data_detail__cont">
        <h3 class="popup_data_detail__tit">歌手简介</h3>
        <p v-for="(line, idx) in songer.desc.split('\n')" :key="idx">
          {{ line }}
        </p>
        <p></p>
      </div>
      <i class="popup_data_detail__arrow"></i>
    </div>
  </div>
</template>

<script>
import DetailInfoCard from "components/common/DetailInfoCard";
import DetailSongerInfo from "components/common/DetailSongerInfo";
import FuncBar from "components/common/FuncBar";
import DetailSonglist from "components/common/DetailSonglist";
import InfoList from "components/common/InfoList";
import {
  getUserDetail,
  getSongerDetail,
  getSongerTop50,
  getSimiSongers,
  getSongerAlbums,
  getSongerMvs,
} from "api";
import {
  createSonger,
  createSimiSonger,
  createUser,
  createAlbums,
  createMvs,
  playSonglist,
  gotoSongerDetail,
  gotoAlbumDetail,
} from "common/utils";
import { playTheAlbum } from "@/apiUtils";

export default {
  data() {
    return {
      moreInfo: false,
      id: null,
      songer: {},
      simiSongers: [],
      hotSongs: [],
      songs: [],
      albums: [],
      mvs: [],
    };
  },
  created() {
    this.id = this.$route.query.id;
    this.init();
  },
  methods: {
    async init() {
      // Get songer detail
      const res1 = await getSongerDetail(this.id);
      this.songer = createSonger(res1.data.data);
      //console.log(this.songer);

      // Get songer top 50
      const res2 = await getSongerTop50(this.id);
      this.hotSongs = res2.data.songs.map((song) => {
        return createSong({
          id: song.id,
          name: song.name,
          artists: song.ar,
          duration: song.dt,
          albumName: song.al.name,
          img: song.al.picUrl,
        });
      });

      // Get simi songer
      const res3 = await getSimiSongers(this.id);
      let simiSongers = res3.data.artists.map((songer) => {
        return createSimiSonger(songer);
      });
      this.simiSongers =
        simiSongers.length > 5 ? simiSongers.slice(0, 5) : simiSongers;

      // Get songer album
      const res4 = await getSongerAlbums({ id: this.id, limit: 5, offset: 0 });
      this.albums = createAlbums(res4.data.hotAlbums);

      // Get songer mv
      const res5 = await getSongerMvs(this.id);
      let mvs = createMvs(res5.data.mvs);
      this.mvs = mvs.length > 5 ? mvs.slice(0, 5) : mvs;
    },
    playHotSongs() {
      playSonglist(this.hotSongs);
    },
    toggleShowMoreInfo() {
      this.moreInfo = !this.moreInfo;
    },
    songerClick(songer) {
      gotoSongerDetail(songer.id);
    },
    playTheAlbum,
    gotoAlbumDetail,
    gotoSongerDetail,
  },
  components: {
    DetailInfoCard,
    DetailSongerInfo,
    FuncBar,
    DetailSonglist,
    InfoList,
  },
};
</script>

<style scoped>
td,
th,
ul {
  margin: 0;
  margin-right: 0px;
  padding: 0;
}

/*overwrite*/
.data__cont {
  padding-top: 31px;
}
/*overwrite*/
.data__name_txt {
  float: left;
  font-size: 38px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  margin-right: 10px;
}
/*overwrite*/
.data__actions {
  bottom: 30px;
}
.data_statistic__item {
  display: inline-block;
  border-right: solid 1px #c9c9c9;
  text-align: center;
  padding-right: 20px;
  margin-right: 20px;
  font-size: 18px;
}
.data_statistic__item--last {
  border-right: 0 none;
}

.mod_part .mv_list__item,
.mod_part .singer_list__item {
  width: 20%;
}
.mod_part .mv_list__item,
.mod_part .playlist__item {
  padding-bottom: 0;
}

.mod_mv {
  height: 183px;
}

.popup_data_detail {
  top: 128px;
  right: 85px;
}
.popup_data_detail__cont {
  max-height: 250px;
  font-size: 14px;
  line-height: 22px;
  margin: 30px 5px 30px 10px;
  overflow-y: auto;
}

a:hover {
  color: #31c27c;
}
</style>
