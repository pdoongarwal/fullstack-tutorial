const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  launchReducer(launch) {
    const {
      flight_number,
      launch_date_unix,
      launch_site,
      mission_name,
      links,
      rocket,
    } = launch;

    return {
      id: flight_number || 0,
      cursor: launch_date_unix,
      site: launch_site && launch_site.site_name,
      mission: {
        name: mission_name,
        missionPatchSmall: links.mission_patch_small,
        missionPatchLarge: links.mission_patch,
      },
      rocket: {
        id: rocket.rocket_id,
        name: rocket.rocket_name,
        type: rocket.rocket_type,
      },
    };
  }

  async getAllLaunches() {
    const response = await this.get("launches");
    return Array.isArray(response)
      ? response.map((launch) => this.launchReducer(launch))
      : [];
  }

  async getLaunchById({ launchId }) {
    const response = await this.get("launches", { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  async getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map((launchId) => this.getLaunchById({ launchId }))
    );
  }
}

module.exports = LaunchAPI;
